import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

interface WindowSize {
    width: number;
    height: number;
}

export default function useWindowResize(): WindowSize {
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [height, setHeight] = useState<number>(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };

        handleResize();
        const debouncedHandleResize = debounce(handleResize, 250);
        window.addEventListener('resize', debouncedHandleResize);
        return () => window.removeEventListener('resize', debouncedHandleResize);
    }, []);

    return {
        width,
        height,
    };
}