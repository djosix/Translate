import { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { translate } from "../background/translate";
import { getBackendSpecs } from "../background/backends";
import { loadSettings } from "../background/settings";
import { BackendSpec } from "../background/types";
import { background } from "../utils/interaction";

const Translate: React.FC = () => {
  const backendSpecs = getBackendSpecs();
  const [text, setText] = useState<string>("");
  const [translated, setTranslated] = useState<string>("");
  const [selectedBackendSpec, setSelectedBackendSpec] = useState<BackendSpec>(
    backendSpecs[0],
  );
  const debouncedText = useDebounce(text, 500);

  useEffect(() => {
    background({
      action: "settings",
      settings: {
        currentBackend: selectedBackendSpec.key,
      },
    });
  }, [selectedBackendSpec]);

  useEffect(() => {
    const callback = async () => {
      const settings = await loadSettings();
      const text = await translate(debouncedText, settings);

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
          value={selectedBackendSpec.key}
          onChange={(e) =>
            setSelectedBackendSpec(
              backendSpecs.find((b) => b.key === e.target.value)!,
            )
          }
        >
          {backendSpecs.map((backend) => (
            <option key={backend.key} value={backend.key}>
              {backend.name}
            </option>
          ))}
        </select>
        {selectedBackendSpec.languageCodes ? (
          <select>
            {Array.from(selectedBackendSpec.languageCodes, (name, code) => (
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
