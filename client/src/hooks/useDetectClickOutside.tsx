import { RefObject, useEffect, useState } from 'react';

// this is a custom hook to detect click event outside of the selected element
const useDetectClickOutside = (
    insideRef: RefObject<HTMLDivElement>,
    initialState: boolean
) => {
    const [isClicked, setIsClicked] = useState<boolean>(initialState);

    const onClick = (event: Event) => {
        if (
            insideRef.current !== null &&
            !insideRef.current.contains(event.target as HTMLInputElement)
        ) {
            setIsClicked(!isClicked);
        }
    };

    useEffect(() => {
        if (isClicked) {
            window.addEventListener('click', onClick);
        }
        return () => {
            window.removeEventListener('click', onClick);
        };
    }, [isClicked, insideRef]);

    return [isClicked, setIsClicked] as const; // const assertion
};

export default useDetectClickOutside;
