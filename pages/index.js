import web3Modal from "web3modal"
import {useState,useEffect,useRef} from "react"
import {Web3Provider} from "@ethersproject/providers";
import styles from '../styles/Home.module.css';
import { useViewerConnection } from '@self.id/react';
import { EthereumAuthProvider } from '@self.id/web';
import { useViewerRecord } from "@self.id/react";



export default function Home() {
  const web3Ref = useRef();
  const [connection,connect,disconnect] = useViewerConnection();

  const getProvider = async()=>{
    const provider = await web3Ref.current.connect();
    const web3Provider = new Web3Provider(provider);
    return web3Provider;
  }

  const connectToSelfID= async()=>{
    console.log(connection.status);
    const ethereumAuthProvider = await getEthereumAuthProvider();
    connect(ethereumAuthProvider);
  }



//creates a new instance of ethereum auth provider
  const getEthereumAuthProvider = async ()=>{
     const wrappedProvider = await getProvider();
     const signer = wrappedProvider.getSigner();
     const address = await  signer.getAddress();
     return new EthereumAuthProvider(wrappedProvider.provider,address);

  }



  useEffect(()=>{
    if(connection.status!=="connected"){
      web3Ref.current = new  web3Modal({
        network:"rinkeby",
        providerOptions:{},
        disableInjectedProvider:false
      });
    }
  },[connection.status])
  return (
    <div className={styles.main}>
      <div className={styles.navbar}>
        <span className={styles.title}>Ceramic Demo</span>
        {connection.status === "connected" ? (
          <span className={styles.subtitle}>Connected</span>
        ) : (
          <button
            onClick={connectToSelfID}
            className={styles.button}
            disabled={connection.status === "connecting"}
          >
            Connect
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.connection}>
          {connection.status === "connected" ? (
            <div>
              <span className={styles.subtitle}>
                Your 3ID is {connection.selfID.id}
              </span>
              <RecordSetter />
            </div>
          ) : (
            <span className={styles.subtitle}>
              Connect with your wallet to access your 3ID
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function RecordSetter() {
  const [name, setName] = useState("");
  const record = useViewerRecord("basicProfile");
 const updateRecordName = async (names) => {
    await record.merge({
      name: name,
    });
  };


  return (
    <div className={styles.content}>
      <div className={styles.mt2}>
        {record.content ? (
          <div className={styles.flexCol}>
            <span className={styles.subtitle}>
              Hello {record.content.name}!
            </span>

            <span>
              The above name was loaded from Ceramic Network. Try updating it
              below.
            </span>
          </div>
        ) : (
          <span>
            You do not have a profile record attached to your 3ID. Create a
            basic profile by setting a name below.
          </span>
        )}
      </div>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.mt2}
      />
      <button onClick={() => updateRecordName(name)}>Update</button>
    </div>
  );
    
}

