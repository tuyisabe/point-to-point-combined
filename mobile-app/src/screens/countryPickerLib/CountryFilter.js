import React from "react";
import { TextInput, StyleSheet, Platform, View } from "react-native";
import { useTheme } from "./CountryTheme";
import { Icon } from '@rneui/themed';
import { Dimensions } from "react-native";
var { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  input: Object.assign(
    { height: 48, width: "70%" },
    Platform.select({
      web: {
        outlineWidth: 0,
        outlineColor: "transparent",
        outlineOffset: 0,
      },
    })
  ),
});
export const CountryFilter = (props) => { 
  const {filterFocus} = props
  const {
    filterPlaceholderTextColor,
    fontFamily,
    fontSize,
    onBackgroundTextColor,
  } = useTheme();
  const name = "search-sharp"
  const type = "ionicon"
  const color = "#1D74E7"
  const size = 25 
  return React.createElement(
    View, {backgroundColor: "white", flexDirection: "row", justifyContent: "flex-start", alignItems: "center",backgroundColor: "white",
    paddingLeft: 10,
    borderRadius: 10,
    width: width - 80,
    elevation: 20,
    height: 45,
    borderColor: filterFocus === true ? "#1D74E7" : "none",
    borderWidth: filterFocus === true ? 3 : 0,},
    React.createElement(Icon, { name, type,color, size }),
    React.createElement(
      TextInput,
      Object.assign(
        {
          testID: "text-input-country-filter",
          autoCorrect: false,
          placeholderTextColor: filterPlaceholderTextColor,
          style: [
            styles.input,
            { fontFamily, fontSize, color: onBackgroundTextColor },
          ],
        },
        props
      )
    )
  );
};
CountryFilter.defaultProps = {
  autoFocus: false,
  placeholder: "Enter country name",
};
