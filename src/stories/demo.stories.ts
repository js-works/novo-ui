import { widget } from "novo-ui";

export default {
  title: "Demo",
};

export const blabla = () => "<b>yyy</b>";

export function demo() {
  return document.createTextNode("xxx");
}

const Counter = widget("my-counter", () => {
  return () => {
    return "Juhu";
  };
});
