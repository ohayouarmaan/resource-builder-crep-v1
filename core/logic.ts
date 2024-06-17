class Logic {
  public logic_code: string;
  public logic_function: Function | undefined;

  constructor(logic: string) {
    this.logic_code = logic;
  }

  get_logic(): Function {
    if (this.logic_function != undefined) return this.logic_function;
    try {
      const func = new Function(`return (${this.logic_code})`)();
      this.logic_function = func;
      return func;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}

export default Logic;
