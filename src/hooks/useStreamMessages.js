import { useState, useEffect, useContext } from "react";
import { XmtpContext } from "../contexts/XmtpContext";
import { useDynamicContext } from "@dynamic-labs/sdk-react";

const useStreamMessages = (peerAddress) => {
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address || null;

  const [providerState, setProviderState] = useContext(XmtpContext);
  const { client, convoMessages } = providerState;
  const [stream, setStream] = useState("");
  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    const getConvo = async () => {
      if (!client || !peerAddress) {
        return;
      }
      setConversation(await client.conversations.newConversation(peerAddress));
    };
    getConvo();
  }, [client, peerAddress]);

  useEffect(() => {
    if (!conversation) return;

    const streamMessages = async () => {
      const newStream = await conversation.streamMessages();
      setStream(newStream);
      for await (const msg of newStream) {
        if (setProviderState) {
          const newMessages = convoMessages.get(conversation.peerAddress) ?? [];
          newMessages.push(msg);
          const uniqueMessages = [
            ...Array.from(
              new Map(newMessages.map((item) => [item["id"], item])).values()
            ),
          ];
          convoMessages.set(conversation.peerAddress, uniqueMessages);
          setProviderState({
            ...providerState,
            convoMessages: new Map(convoMessages),
          });
        }
      }
    };
    streamMessages();

    return () => {
      const closeStream = async () => {
        if (!stream) return;
        await stream.return();
      };
      closeStream();
    };
    // eslint-disable-next-line
  }, [convoMessages, walletAddress, conversation]);
};

export default useStreamMessages;
