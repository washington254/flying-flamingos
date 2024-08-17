import { useFont, useGLTF } from "@react-three/drei";
import { atom, useAtom } from "jotai";

export const themeAtom = atom("underwater");

export const THEMES = {
  underwater: {
    key: "underwater",
    skyColor: "#309BFF",
    sunColor: "#FFFFFF",
    groundColor: "#FFFFFF",
    title: "Underwater",
    subtitle: "World",
    models: [
     `flamingo1`,`flamingo2`,
    ],
    dof: true,
  },
  space: {
    key: "space",
    skyColor: "#000000",
    sunColor: "#e1ae4e",
    groundColor: "#333333",
    title: "Space",
    subtitle: "World",
    models: [`flamingo1`,`flamingo2`,`flamingo3`,`flamingo4`],
    dof: false,
  },
};

Object.values(THEMES).forEach((theme) => {
  theme.models.forEach((model) => useGLTF.preload(`/models/${model}.glb`));
  
});

useFont.preload("/fonts/Poppins Black_Regular.json");

export const UI = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  return (
    <>
   
    </>
  );
};
