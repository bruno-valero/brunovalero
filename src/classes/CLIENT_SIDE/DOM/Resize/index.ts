



export default class ResizableElement {

  constructor(
    protected _element:HTMLElement | null,
  ) {}

  get element() {
    return this._element;
  }

  updateElement(el:HTMLElement) {
    this._element = el;
  }
}