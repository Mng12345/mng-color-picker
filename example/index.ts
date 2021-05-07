import {stringifyNoCircle} from "mng-easy-util/json";
import {ColorPicker} from "../src";

ColorPicker.init({
  rootElement: document.getElementById('app')!,
  onSelectedColor: (selectedColor: ColorPicker.Color) => {
    console.log(`selectedColor:\n${stringifyNoCircle(selectedColor)}`)
    const root = document.getElementById('app') as HTMLDivElement
    const r = Math.ceil(selectedColor.r * 255)
    const g = Math.ceil(selectedColor.g * 255)
    const b = Math.ceil(selectedColor.b * 255)
    root.style['background'] = `rgba(${r},${g},${b},${selectedColor.a})`
  },
  initColor: '0x7cb305',
  width: 100,
  backgroundColor: '#8c8c8c'
})
