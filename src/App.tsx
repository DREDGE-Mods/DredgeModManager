import "./App.css";

// Import our custom CSS
import './scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

function App() {
  return (
    <body className="bg-dark text-light min-vh-100">
      <div className="h-100 w-100 container min-vh-100">
        <h1 className="text-center">Dredge Mod Manager</h1>
        <br/>
        <div className="text-start">
            Dredge folder path:
        </div>
        <div>
          <input type="text" id="dredge-path-text" className="w-75"></input>
          <button className="w-25">...</button>
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
