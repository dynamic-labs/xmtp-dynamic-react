import React, { useState, createContext, useEffect } from "react";
import { Client } from "@xmtp/xmtp-js";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
export const XmtpContext = createContext();

export const XmtpContextProvider = ({ children }) => {
  // const [primaryWalletState, setPrimaryWalletState] = useState(null);
  const [walletAddress, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);

  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    const getAndSetSigner = async () => {
      const signer = await primaryWallet.connector.getSigner();
      setSigner(signer);
    };

    if (primaryWallet) {
      const { address } = primaryWallet;
      setAddress(address);
      getAndSetSigner();
    }
  }, [primaryWallet]);

  const [providerState, setProviderState] = useState({
    client: null,
    initClient: () => {},
    loadingConversations: true,
    conversations: new Map(),
    convoMessages: new Map(),
  });

  const initClient = async () => {
    if (signer && !providerState.client) {
      try {
        console.log("Initializing client");
        console.log(signer);

        const keys = await Client.getKeys(signer, { env: "dev" });
        const client = await Client.create(null, {
          env: "dev",
          privateKeyOverride: keys,
        });
        setProviderState({
          ...providerState,
          client,
        });
      } catch (e) {
        console.error(e);
        setProviderState({
          ...providerState,
          client: null,
        });
      }
    }
  };

  const disconnect = () => {
    setProviderState({
      ...providerState,
      client: null,
      conversations: new Map(),
      convoMessages: new Map(),
    });
  };

  useEffect(() => {
    signer ? setProviderState({ ...providerState, initClient }) : disconnect();
    // eslint-disable-next-line
  }, [signer]);

  useEffect(() => {
    if (!providerState.client) return;

    const listConversations = async () => {
      console.log("Listing conversations");
      setProviderState({ ...providerState, loadingConversations: true });
      const { client, convoMessages, conversations } = providerState;
      const convos = (await client.conversations.list()).filter(
        (conversation) => !conversation.context?.conversationId
      );
      Promise.all(
        convos.map(async (convo) => {
          if (convo.peerAddress !== walletAddress) {
            const messages = await convo.messages();
            convoMessages.set(convo.peerAddress, messages);
            conversations.set(convo.peerAddress, convo);
            setProviderState({
              ...providerState,
              convoMessages,
              conversations,
            });
          }
        })
      ).then(() => {
        setProviderState({ ...providerState, loadingConversations: false });
      });
    };

    listConversations();
    // eslint-disable-next-line
  }, [providerState.client]);

  return (
    <XmtpContext.Provider value={[providerState, setProviderState]}>
      {children}
    </XmtpContext.Provider>
  );
};
