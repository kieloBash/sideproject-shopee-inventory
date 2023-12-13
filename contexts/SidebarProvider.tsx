"use client";
import * as React from "react";

export type SidebarContextType = {
  toggle: boolean;
  setToggle: (temp: boolean) => void;
};

export const SidebarContext = React.createContext<SidebarContextType>({
  toggle: false,
  setToggle: (temp: boolean) => {},
});

export const useSidebar = () => React.useContext(SidebarContext);

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [toggle, setToggle] = React.useState<boolean>(false);

  return (
    <SidebarContext.Provider
      value={{
        toggle,
        setToggle,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;
