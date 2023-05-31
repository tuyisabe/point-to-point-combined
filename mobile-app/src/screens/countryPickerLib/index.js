var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };
import React from "react";
import { CountryProvider, DEFAULT_COUNTRY_CONTEXT } from "./CountryContext";
import { ThemeProvider, DEFAULT_THEME } from "./CountryTheme";
import { CountryPicker } from "./CountryPicker";
const Main = (_a) => {
  var { theme, translation } = _a,
    props = __rest(_a, ["theme", "translation"]);
  return React.createElement(
    ThemeProvider,
    { theme: Object.assign(Object.assign({}, DEFAULT_THEME), theme) },
    React.createElement(
      CountryProvider,
      {
        value: Object.assign(Object.assign({}, DEFAULT_COUNTRY_CONTEXT), {
          translation,
        }),
      },
      React.createElement(CountryPicker, Object.assign({}, props))
    )
  );
};
Main.defaultProps = {
  onSelect: () => {},
  withEmoji: true,
};
export default Main;
export {
  getCountriesAsync as getAllCountries,
  getCountryCallingCodeAsync as getCallingCode,
} from "./CountryService";
export { CountryModal } from "./CountryModal";
export { DARK_THEME, DEFAULT_THEME } from "./CountryTheme";
export { CountryFilter } from "./CountryFilter";
export { CountryList } from "./CountryList";
export { FlagButton } from "./FlagButton";
export { Flag } from "./Flag";
export { HeaderModal } from "./HeaderModal";
export { CountryModalProvider } from "./CountryModalProvider";
export * from "./types";
