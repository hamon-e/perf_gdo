import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

type StateHook<T> = [T, Dispatch<SetStateAction<T>>];

export interface AuthenticatedUser {
  name?: string;
  role_id?: number;
  [key: string]: unknown;
}

interface ContextValue {
  languageStateHook: StateHook<string>;
  connectedStateHook: StateHook<boolean | undefined>;
  isAdminHook: StateHook<boolean>;
  userHook: StateHook<AuthenticatedUser>;
  headerTitleHook: StateHook<string | null>;
  headerLocalizationHook: StateHook<string | null>;
  errorMessageHook: StateHook<string | null>;
  showBarHook: StateHook<boolean>;
  openHook: StateHook<boolean>;
}

interface ContextProviderProps {
  children: ReactNode;
}

const Context = createContext<ContextValue | undefined>(undefined);

function ContextProvider({ children }: ContextProviderProps) {
  const { t } = useTranslation('Header');
  const [language, setLanguage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser>({});
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);
  const [headerTitleLocalization, setHeaderTitleLocalization] = useState<string | null>(null);
  const [errorMessage, updateErrorMessage] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>();
  const [showBar, setShowBar] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setHeaderTitleLocalization(headerTitle ? String(t(headerTitle)) : null);
  }, [headerTitle, language, t]);

  const value = useMemo<ContextValue>(() => ({
    languageStateHook: [language, setLanguage],
    connectedStateHook: [connected, setConnected],
    isAdminHook: [isAdmin, setIsAdmin],
    userHook: [user, setUser],
    headerTitleHook: [headerTitle, setHeaderTitle],
    headerLocalizationHook: [headerTitleLocalization, setHeaderTitleLocalization],
    errorMessageHook: [errorMessage, updateErrorMessage],
    showBarHook: [showBar, setShowBar],
    openHook: [open, setOpen],
  }), [
    connected,
    errorMessage,
    headerTitle,
    headerTitleLocalization,
    isAdmin,
    language,
    open,
    showBar,
    user,
  ]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function useContextObject(): ContextValue {
  const value = useContext(Context);
  if (!value) throw new Error('useContextObject must be used inside ContextProvider');
  return value;
}

const ContextConsumer = Context.Consumer;

export { Context, ContextProvider, ContextConsumer, useContextObject };
