#!/usr/bin/env python3
"""Regression tests for duplicate-title UID resolution in classify_anshim.py.

Background: the anshimtea.com catalog contains two distinct products sharing
the romanized title 'Shan Cha' (山茶):

  - uid 585900738011  Taiwan wild BLACK tea, url .../shan-cha-mountain-tea
  - uid 175462636974  Fujian GREEN tea,     url .../shan-cha-mountains-tea-fujian

'2017 Laobanzhang Lao Shu' is a second collision (sheng vs shu puer).
Title-only cls('Shan Cha', ...) originally crashed with:

  AssertionError: non-unique: Shan Cha: [585900738011, 175462636974]

The fix gives cls() an optional url_hint= that disambiguates, and makes the
assert failure list the colliding uids + urls and tell the caller to pass
url_hint=. These tests pin that behavior.

Run:  pytest scripts/test_classify_anshim.py

To test a different variant of the script (e.g. the pre-fix version, to
confirm these tests would have failed):

  CLASSIFY_ANSHIM_SCRIPT=/tmp/classify_head.py pytest scripts/test_classify_anshim.py
"""
import importlib.util
import json
import os
import pathlib
import subprocess
import sys

import pytest

REPO_SCRIPTS = pathlib.Path(__file__).resolve().parent
SCRIPT = pathlib.Path(
    os.environ.get('CLASSIFY_ANSHIM_SCRIPT', REPO_SCRIPTS / 'classify_anshim.py'))
DATA = pathlib.Path('/tmp/anshim-clean.json')

TAIWAN_UID = 585900738011
FUJIAN_UID = 175462636974
TAIWAN_HINT = 'shan-cha-mountain-tea'
FUJIAN_HINT = 'mountains-tea-fujian'
SHENG_UID = 443583400441   # 2017 Laobanzhang Lao Shu (sheng)
SHU_UID = 134402037641     # 2017 Laobanzhang Lao Shu (shu)


def _load_module():
    spec = importlib.util.spec_from_file_location('classify_anshim_under_test', SCRIPT)
    assert spec is not None and spec.loader is not None, f'cannot load {SCRIPT}'
    mod = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)   # runs the whole classification pipeline
    return mod


@pytest.fixture(scope='module')
def m():
    if not SCRIPT.exists():
        pytest.skip(f'script not found: {SCRIPT}')
    if not DATA.exists():
        pytest.skip(f'catalog data not found: {DATA} (regenerate /tmp/anshim-clean.json)')
    return _load_module()


@pytest.fixture()
def clean_cls(m):
    """Snapshot m.CLS around each test so module state stays pristine."""
    snapshot = dict(m.CLS)
    yield m
    m.CLS.clear()
    m.CLS.update(snapshot)


# ---------------------------------------------------------------- end-to-end

def test_shan_cha_rows_end_to_end(m):
    """The two 'Shan Cha' products land as separate, correctly-classified rows.

    Pre-fix this crashed the whole script with
    AssertionError: non-unique: Shan Cha: [585900738011, 175462636974].
    """
    by_uid = {r['uid']: r for r in m.rows}
    taiwan, fujian = by_uid[TAIWAN_UID], by_uid[FUJIAN_UID]
    assert taiwan['name'] == 'Shan Cha (Taiwan)'
    assert taiwan['tea_type'] == 'black'
    assert taiwan['original_name'] == '山茶'
    assert TAIWAN_HINT in taiwan['url']
    assert fujian['name'] == 'Shan Cha (Fujian)'
    assert fujian['tea_type'] == 'green'
    assert fujian['original_name'] == '山茶'
    assert FUJIAN_HINT in fujian['url']
    # no other Shan Cha row exists
    assert [r for r in m.rows if 'Shan Cha' in r['name']] == [taiwan, fujian]


def test_laobanzhang_sheng_shu_rows_end_to_end(m):
    """Second known collision: sheng keeps the title, shu gets a distinct name."""
    by_uid = {r['uid']: r for r in m.rows}
    assert by_uid[SHENG_UID]['tea_type'] == 'sheng_puerh'
    assert by_uid[SHENG_UID]['name'] == '2017 Laobanzhang Lao Shu'
    assert by_uid[SHU_UID]['tea_type'] == 'shou_puerh'
    assert by_uid[SHU_UID]['name'] == 'Lao Ban Zhang Lao Shu Shu'


def test_uid_of_picks_correct_uid(m):
    """uid_of resolves the collision to the right uid when given a url_hint,
    and still works hint-less for unique titles."""
    assert m.uid_of('DEEP JUNGLE') == 356038817872
    assert m.uid_of('Shan Cha', url_hint=TAIWAN_HINT) == TAIWAN_UID
    assert m.uid_of('Shan Cha', url_hint=FUJIAN_HINT) == FUJIAN_UID


# ------------------------------------------------- cls() duplicate handling

def test_cls_url_hint_resolves_collision(clean_cls):
    """cls(url_hint=...) assigns the classification to the intended uid."""
    clean_cls.cls('Shan Cha', 'black', 'true_tea', '山茶',
                  name_override='Shan Cha (Taiwan)', url_hint=TAIWAN_HINT)
    clean_cls.cls('Shan Cha', 'green', 'true_tea', '山茶',
                  name_override='Shan Cha (Fujian)', url_hint=FUJIAN_HINT)
    assert clean_cls.CLS[TAIWAN_UID]['tea_type'] == 'black'
    assert clean_cls.CLS[TAIWAN_UID]['name_override'] == 'Shan Cha (Taiwan)'
    assert clean_cls.CLS[FUJIAN_UID]['tea_type'] == 'green'
    assert clean_cls.CLS[FUJIAN_UID]['name_override'] == 'Shan Cha (Fujian)'


def test_cls_without_hint_raises_clear_error(clean_cls):
    """Hint-less cls() on a duplicate title must raise AssertionError, and the
    message must name both colliding uids and tell the caller how to fix it.

    Pre-fix the message was just 'non-unique: Shan Cha: [uids]' with no urls
    and no url_hint guidance.
    """
    before = dict(clean_cls.CLS)
    with pytest.raises(AssertionError) as exc:
        clean_cls.cls('Shan Cha', 'black', 'true_tea', '山茶')
    msg = str(exc.value)
    assert str(TAIWAN_UID) in msg, msg
    assert str(FUJIAN_UID) in msg, msg
    assert 'url_hint' in msg, msg          # tells the caller the fix
    assert TAIWAN_HINT in msg, msg         # lists the colliding urls
    assert FUJIAN_HINT in msg, msg
    # the failed call classified nothing new (module pipeline pre-populates
    # CLS with both Shan Cha uids at import time)
    assert dict(clean_cls.CLS) == before


def test_cls_wrong_hint_raises_assertion(clean_cls):
    """A url_hint that matches nothing must fail loudly (AssertionError naming
    the title), never silently classify a wrong uid."""
    before = dict(clean_cls.CLS)
    with pytest.raises(AssertionError) as exc:
        clean_cls.cls('Shan Cha', 'black', 'true_tea', '山茶',
                      url_hint='no-such-product')
    assert 'Shan Cha' in str(exc.value)


# ------------------------------------------------- whole-script execution

def test_script_runs_end_to_end_without_crash(tmp_path):
    """Run the classify script as a real subprocess and assert it completes
    without AssertionError and writes valid output.

    This is the original crash mode: pre-fix, the script died mid-run with
    AssertionError: non-unique: Shan Cha: [585900738011, 175462636974] --
    the in-process tests above import the module, but a syntax/exec or
    __main__-path issue would only show up as a process failure.

    Script override: CLASSIFY_ANSHIM_SCRIPT=/tmp/classify_crash.py pytest ...
    """
    script = pathlib.Path(os.environ.get('CLASSIFY_ANSHIM_SCRIPT', REPO_SCRIPTS / 'classify_anshim.py'))
    if not script.exists():
        pytest.skip(f'script not found: {script}')
    if not DATA.exists():
        pytest.skip(f'catalog data not found: {DATA} (regenerate /tmp/anshim-clean.json)')

    out = tmp_path / 'classified.json'
    env = dict(os.environ)
    # the script hardcodes its output path; run a copy that writes to tmp
    run_script = tmp_path / 'classify_run.py'
    src = script.read_text(encoding='utf-8')
    run_script.write_text(
        src.replace("open('/tmp/anshim-classified.json','w')",
                    f"open({str(out)!r},'w')"),
        encoding='utf-8')
    assert run_script.read_text(encoding='utf-8') != src, \
        'output-path replacement failed -- script changed?'

    proc = subprocess.run(
        [sys.executable, str(run_script)],
        capture_output=True, text=True, timeout=300, env=env)
    sys.stderr.write(proc.stderr[-2000:] if proc.stderr else '')
    assert proc.returncode == 0, (
        f'script exited {proc.returncode}; stderr tail:\n{proc.stderr[-2000:]}')
    assert 'AssertionError' not in proc.stderr, proc.stderr[-2000:]
    assert 'UNCLASSIFIED' not in proc.stdout, proc.stdout[-2000:]

    payload = json.loads(out.read_text(encoding='utf-8'))
    by_uid = {r['uid']: r for r in payload['rows']}
    # both Shan Cha rows classified, distinct, with url-hinted products
    taiwan, fujian = by_uid[TAIWAN_UID], by_uid[FUJIAN_UID]
    assert taiwan['tea_type'] == 'black' and 'Shan Cha' in taiwan['name']
    assert TAIWAN_HINT in taiwan['url']
    assert fujian['tea_type'] == 'green' and 'Shan Cha' in fujian['name']
    assert FUJIAN_HINT in fujian['url']
    assert len(payload['rows']) > 0 and len(payload['skipped']) > 0