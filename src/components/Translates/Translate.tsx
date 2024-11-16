import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import { createTranslator } from "../../background/translator";
import { loadSettings } from "../../background/settings";
import { background } from "../../utils/interaction";

const { translate, getBackends } = createTranslator();

const Translate: React.FC = () => {
  const backends = getBackends();
  const [text, setText] = useState<string>("");
  const [translated, setTranslated] = useState<string>("");
  const [selectedBackend, setSelectedBackend] = useState<(typeof backends)[0]>(
    backends[0],
  );
  const debouncedText = useDebounce(text, 500);

  useEffect(() => {
    background({
      action: "settings",
      settings: {
        translator: {
          backend: selectedBackend,
        },
      },
    });
  }, [selectedBackend]);

  useEffect(() => {
    const callback = async () => {
      const settings = await loadSettings();
      const text = await translate(debouncedText, settings.translator);

      if (text !== null) setTranslated(text);
    };
    callback();
  }, [debouncedText]);

  return (
    <main className="flex gap-1 flex-col m-4">
      <section>
        <h1 className="text-xl">Translate</h1>
      </section>
      <section className="flex justify-between w-full">
        <select
          name="translator"
          value={selectedBackend.key}
          onChange={(e) =>
            setSelectedBackend(backends.find((b) => b.key === e.target.value)!)
          }
        >
          {backends.map((backend) => (
            <option key={backend.key} value={backend.key}>
              {backend.name}
            </option>
          ))}
        </select>
        {selectedBackend.languages ? (
          <select>
            {Object.entries(selectedBackend.languages).map(([name, code]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          <input></input>
        )}
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
        <textarea value={translated} className="w-full" name="dst" />
      </section>
    </main>
  );
};

export default Translate;
