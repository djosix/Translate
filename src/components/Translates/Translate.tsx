import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";

const Translate: React.FC = () => {
  const [text, setText] = useState<string>("");
  const debouncedText = useDebounce(text, 500);

  useEffect(() => {
    console.log(debouncedText);
  }, [debouncedText]);

  return (
    <>
      <h1>Translate</h1>
      <select name="translator">
        <option value="google">Google</option>
        <option value="yandex">Yandex</option>
        <option value="bing">Bing</option>
      </select>
      <select name="language">
        <option value="en">English</option>\
      </select>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        name="src"
      />
      <textarea name="dst" />
    </>
  );
};

export default Translate;
