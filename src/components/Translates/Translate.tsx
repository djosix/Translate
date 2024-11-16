import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";

const Translate: React.FC = () => {
  const [text, setText] = useState<string>("");
  const debouncedText = useDebounce(text, 500);

  useEffect(() => {
    console.log(debouncedText);
  }, [debouncedText]);

  return (
    <main className="flex gap-1 flex-col m-4">
      <section>
        <h1 className="text-xl">Translate</h1>
      </section>
      <section className="flex justify-between w-full">
        <select name="translator">
          <option value="google">Google</option>
          <option value="yandex">Yandex</option>
          <option value="bing">Bing</option>
        </select>
        <select name="language">
          <option value="en">English</option>\
        </select>
      </section>
      <section>
        <textarea
          className="w-full"
          value={text}
          onChange={(e) => setText(e.target.value)}
          name="src"
        />
      </section>
      <section>
        <textarea className="w-full" name="dst" />
      </section>
    </main>
  );
};

export default Translate;
