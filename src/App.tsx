import "./App.css";
import './scss/styles.scss'
import * as bootstrap from 'bootstrap'
import { open } from "@tauri-apps/api/dialog";
import {useState} from 'react';

function App() {
  const [dredgePath, setDredgePath] = useState("");

  const readFileContents = async () => {
    try {
      const selectedPath = await open({
        multiple: false,
        title: "Select DREDGE game folder",
        directory: true
      });
      setDredgePath(selectedPath as string);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <body className="bg-dark text-light min-vh-100">
      <div className="h-100 w-100 container min-vh-100">
        <br/>
        <h1 className="text-center">Dredge Mod Manager</h1>
        <br/>
        <div className="text-start">
            Dredge folder path:
        </div>
        <div>
          <input type="text" className="w-75" onChange={(e) => setDredgePath(e.target.value)} value={dredgePath}></input>
          <button className="w-25" onClick={readFileContents}>...</button>
        </div>

        <br/>

        <div>
          <input type="checkbox" className="m-2"></input>
          <span><b>Winch</b> - Mod loader for DREDGE <i>by Hacktix</i></span>
        </div>

        <div>
          <input type="checkbox" className="m-2"></input>
          <span><b>Cosmic Horror Fishing Buddies</b> - Online multiplayer for DREDGE <i>by xen-42</i></span>
        </div>
      </div>
    </body>

  );
}

export default App;
