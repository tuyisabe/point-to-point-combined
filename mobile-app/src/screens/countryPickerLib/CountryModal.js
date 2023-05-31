var __rest = (this && this.__rest) || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
};
import * as React from 'react';
import { SafeAreaView, StyleSheet, Platform, Dimensions } from 'react-native';
import { AnimatedModal } from './AnimatedModal';
import { Modal } from './Modal';
import { useTheme } from './CountryTheme';
import { CountryModalContext } from './CountryModalProvider';
var { height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
      flex: 1,
     
  },
});
export const CountryModal = (_a) => {
  var { children, withModal, disableNativeModal } = _a, props = __rest(_a, ["children", "withModal", "disableNativeModal"]);
  const { backgroundColor } = useTheme();
  const { teleport } = React.useContext(CountryModalContext);
  const content = (React.createElement(SafeAreaView, { style: [styles.container, { backgroundColor }] }, children));
  React.useEffect(() => {
      if (disableNativeModal) {
          teleport(React.createElement(AnimatedModal, Object.assign({}, props), content));
      }
  }, [disableNativeModal]);
  if (withModal) {
      if (Platform.OS === 'web') {
          return React.createElement(Modal, Object.assign({}, props), content);
      }
      if (disableNativeModal) {
          return null;
      }
      return React.createElement(Modal, Object.assign({}, props), content);
  }
  return content;
};
CountryModal.defaultProps = {
  animationType: 'slide',
  animated: true,
  withModal: true,
  disableNativeModal: false,
};