import React, {useState, useEffect, useContext} from 'react';
import { useTranslation } from 'react-i18next';

const Context = React.createContext();

const ContextProvider = props => {
  const { t, i18n } = useTranslation('Header');
  const [language, setLanguage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState({})
  const [restaurant, setRestaurant] = useState(-1);
  const [headerTitle, setHeaderTitle] = useState(null)
  const [headerTitleLocalization, setHeaderTitleLocalization] = useState(null)
  const [errorMessage, updateErrorMessage] = useState(null);
  const [connected, setConnected] = useState()
  const [showBar, setShowBar] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setHeaderTitleLocalization(t(headerTitle))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTitle, language])

  return (
    <Context.Provider value={{
        languageStateHook: [language, setLanguage],
        connectedStateHook: [connected, setConnected],
        isAdminHook: [isAdmin, setIsAdmin],
        userHook: [user, setUser],
        restaurantHook: [restaurant, setRestaurant],
        headerTitleHook: [headerTitle, setHeaderTitle],
        headerLocalizationHook: [headerTitleLocalization, setHeaderTitleLocalization],
        errorMessageHook: [errorMessage, updateErrorMessage],
        showBarHook: [showBar, setShowBar],
        openHook: [open, setOpen]
        }}>
      {props.children}
    </Context.Provider>
  );
};

const ContextConsumer = Context.consumer;

const useContextObject = () => useContext(Context);

export {Context, ContextProvider, ContextConsumer, useContextObject};
