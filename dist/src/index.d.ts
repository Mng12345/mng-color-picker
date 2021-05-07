export declare namespace ColorPicker {
    type Color = {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    type OnSelectedColor = (selectedColor: Color) => void;
    const init: ({ rootElement, width, initColor, onSelectedColor, backgroundColor }: {
        rootElement: HTMLElement;
        width?: number | undefined;
        initColor?: string | undefined;
        onSelectedColor?: OnSelectedColor | undefined;
        backgroundColor?: string | undefined;
    }) => void;
}
