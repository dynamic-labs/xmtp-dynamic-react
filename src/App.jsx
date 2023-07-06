// import { DynamicContextProvider, DynamicWidget} from '@dynamic-labs/sdk-react';
import { XmtpContextProvider } from "./contexts/XmtpContext";
import Home from "./components/Home";
import { Buffer } from "buffer";
import "./styles/styles.css"
import "./App.css";

import { DynamicContextProvider } from '@dynamic-labs/sdk-react';

window.Buffer = Buffer;

function App() {
  return (
    <div className="App">
        <DynamicContextProvider
        settings={{
          environmentId: '4e598b41-f388-489b-a0b3-d24064b1d1ed'
        }}>
          <XmtpContextProvider>
            <Home />
          </XmtpContextProvider>

        </DynamicContextProvider>
    </div>
  );
}

export default App;
