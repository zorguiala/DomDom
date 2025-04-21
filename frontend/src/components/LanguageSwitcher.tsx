import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";

const languages = {
  en: "English",
  fr: "Français",
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      size="small"
      sx={{ minWidth: 120 }}
    >
      {Object.entries(languages).map(([code, name]) => (
        <MenuItem key={code} value={code}>
          {name}
        </MenuItem>
      ))}
    </Select>
  );
}
