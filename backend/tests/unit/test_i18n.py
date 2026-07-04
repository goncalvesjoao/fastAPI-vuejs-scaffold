import pytest

from your_project_name.i18n import I18n, MissingTranslationError


def test_i18n_translates_and_interpolates_messages():
    message = I18n("en").t("validation.string_too_short", min_length=3)

    assert message == "Please enter at least 3 character(s)"


def test_i18n_resolves_regional_locales():
    assert I18n("ja-JP").locale == "ja"


def test_i18n_uses_accept_language_quality_values():
    i18n = I18n.from_accept_language("ja-JP;q=0.5, en-US;q=0.9")

    assert i18n.locale == "en"


def test_i18n_skips_unsupported_preferred_languages():
    i18n = I18n.from_accept_language("enochian;q=0.9, ja;q=0.5")

    assert i18n.locale == "ja"


def test_i18n_uses_the_given_fallback_for_an_unknown_key():
    message = I18n("ja").t("unknown.key", fallback="Original message")

    assert message == "Original message"


def test_i18n_raises_for_an_unknown_key_without_a_fallback():
    with pytest.raises(MissingTranslationError):
        I18n("en").t("unknown.key")
