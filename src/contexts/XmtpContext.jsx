import React, { useState, createContext, useEffect } from "react";
import { Client } from "@xmtp/xmtp-js";
import { useDynamicContext } from '@dynamic-labs/sdk-react';
export const XmtpContext = createContext();

export const XmtpContextProvider = ({ children }) => {
  const [primaryWalletState, setPrimaryWalletState] = useState(null);
  const [walletAddress, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);

  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    if(primaryWalletState === null && primaryWallet !== null) {
      setPrimaryWalletState(primaryWallet);
      setAddress(primaryWallet.address);
      primaryWallet.connector.getSigner().then((signer) => setSigner(signer));
    }  else if (primaryWalletState !== null && primaryWallet === null) {
      setPrimaryWalletState(null);
      setAddress(null);
      setSigner(null);
    }
  }, [primaryWallet]);

  const [providerState, setProviderState] = useState({
    client: null,
    initClient: () => {},
    loadingConversations: true,
    conversations: new Map(),
    convoMessages: new Map(),
  });

  const initClient = async (wallet) => {
    if (wallet && !providerState.client) {
      try {
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
    console.log(signer)
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
