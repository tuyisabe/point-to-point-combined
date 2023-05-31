import React from 'react';
import { View, StyleSheet } from 'react-native';
import CloseButton from './CloseButton';
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60
    }
});
export const HeaderModal = (props) => {
    const { withFilter, withCloseButton, closeButtonImage, closeButtonStyle, closeButtonImageStyle, onClose, renderFilter } = props;
    return (React.createElement(View, { style: styles.container },
        withCloseButton && React.createElement(CloseButton, { image: closeButtonImage, style: closeButtonStyle, imageStyle: closeButtonImageStyle, onPress: onClose }),
        withFilter && renderFilter(props)));
};
HeaderModal.defaultProps = {
    withCloseButton: true
};
