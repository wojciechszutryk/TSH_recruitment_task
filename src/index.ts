import { Server } from "./server/Server";

class Launcher {
    private server = new Server();

    public startServer(){
        this.server.startServer();
    }
}

const launcher = new Launcher();
launcher.startServer();