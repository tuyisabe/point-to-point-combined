import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
const isOrientationPortrait = ({ width, height }) => height >= width;
const isOrientationLandscape = ({ width, height }) => width >= height;
export function useDeviceOrientation() {
    const screen = Dimensions.get('screen');
    const initialState = {
        portrait: isOrientationPortrait(screen),
        landscape: isOrientationLandscape(screen),
    };
    const [orientation, setOrientation] = useState(initialState);
    useEffect(() => {
        const onChange = ({ screen }) => {
            setOrientation({
                portrait: isOrientationPortrait(screen),
                landscape: isOrientationLandscape(screen),
            });
        };
        const subscription = Dimensions.addEventListener('change', onChange);
        return () => {
            if (typeof (subscription === void 0 || subscription === void 0 ? void 0 : subscription.remove) === 'function') {
                subscription.remove();
            }
            else {
                // React Native < 0.65
                Dimensions.removeEventListener('change', onChange);
            }
        };
    }, []);
    return orientation.portrait === true ? 'PORTRAIT' : 'LANDSCAPE';
}