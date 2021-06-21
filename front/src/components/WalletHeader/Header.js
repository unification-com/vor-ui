import React, { useEffect } from "react"
import { useRef } from "react"
import { useState } from "react"
import "./Header.css"
import {shortHash} from "../../utils/common"

const Header = ({onWalletConnect, onWalletDisconnect, address, balance}) => {
  const [isLogVisible, setLogVisible] = useState(false)
  const logRef = useRef();

  const HideLogDropdown = (event) => {
    if (logRef && !logRef.current?.contains(event.target)) {
      setLogVisible(false);
    }
  }
  useEffect(() => {
      document.addEventListener('mousedown', HideLogDropdown);

      return () => {
        document.removeEventListener('mousedown', HideLogDropdown);
      }
  }, [])
  return (
    <div className="header">
      {address?
          <div className="button__signup" onClick={() => {
              setLogVisible(true);
          }}>
              {shortHash(address)}
              {isLogVisible?
                  <div className="dropdownlist" ref={logRef}>
                      <div className="dropdown__item" onClick={onWalletDisconnect}>Disconnect Wallet</div>
                  </div>:(null)}
          </div>:
          <div className="button__signup" onClick={onWalletConnect}>Connect your wallet</div>
      }
    </div>
  )
}
export default Header
