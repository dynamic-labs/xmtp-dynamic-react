import React, { useContext } from "react";
import { shortAddress } from "../utils/utils";
import xmtpLogo from "../assets/xmtp-logo.png";
import { XmtpContext } from "../contexts/XmtpContext";

import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react';

const Header = () => {
  const [providerState] = useContext(XmtpContext);
  const { primaryWallet } = useDynamicContext();

  const getSigner = async () => {
    return await primaryWallet.connector.getSigner();
  }

  const initClientWithSigner = async () => {
    const signer = await getSigner();
    return providerState.initClient(signer);
  }

  return (
      <div className="header flex align-center justify-between">
        <img className="logo" alt="XMTP Logo" src={xmtpLogo} />
        {primaryWallet?.address && <h3>{shortAddress(primaryWallet?.address)}</h3>}
        {primaryWallet?.address && !providerState.client ? (
          <div className="flex align-center header-mobile">
            {!providerState.client && (
              <button
                className="btn"
                onClick={() => initClientWithSigner()}
              >
                Connect to XMTP
              </button>
            )}
          </div>
          ) : <DynamicWidget />
        }
      </div>
  );
};

export default Header;
