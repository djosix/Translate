import { createContext } from "react";

const context = createContext(null);

const UserInfoContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <context.Provider value={null}>{children}</context.Provider>;
};

export default UserInfoContextProvider;
