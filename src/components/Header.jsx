import React, { useContext } from "react";
import { shortAddress } from "../utils/utils";
import xmtpLogo from "../assets/xmtp-logo.png";
import { XmtpContext } from "../contexts/XmtpContext";

import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { useState, useEffect } from "react";

const Header = () => {
  const [primaryWalletState, setPrimaryWalletState] = useState(null);
  const [walletAddress, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);

  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    if(primaryWalletState === null && primaryWallet !== null) {
      setPrimaryWalletState(primaryWallet);
      setAddress(primaryWallet.address);
      primaryWallet.connector.getSigner().then((signer) => setSigner(signer));
    } else if (primaryWalletState !== null && primaryWallet === null) {
      setPrimaryWalletState(null);
      setAddress(null);
      setSigner(null);
    }
  }, [primaryWallet]);


  const [providerState] = useContext(XmtpContext);

  return (
    <div className="header flex align-center justify-between">
      <img className="logo" alt="XMTP Logo" src={xmtpLogo} />
      {walletAddress && (
        <div className="flex align-center header-mobile">
          <h3>{shortAddress(walletAddress)}</h3>
          {!providerState.client && (
            <button
              className="btn"
              onClick={() => providerState.initClient(signer)}
            >
              Connect to XMTP
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
