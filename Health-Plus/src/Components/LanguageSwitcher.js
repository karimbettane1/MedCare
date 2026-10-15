import React from "react";
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <label htmlFor="language-switcher" style={{ fontWeight: 600 }}>
        {t("common.language")}:
      </label>
      <select
        id="language-switcher"
        value={i18n.language}
        onChange={handleChange}
        style={{ padding: "6px 10px", borderRadius: 8 }}
      >
        <option value="fr">{t("common.french")}</option>
        <option value="en">{t("common.english")}</option>
        <option value="ar">{t("common.arabic")}</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;
