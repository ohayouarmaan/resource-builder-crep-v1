import assert from "assert";
import express, { Request, Response } from "express";
import Logic from "./logic";

enum Methods {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

export interface IServerRoute {
    path: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | null;
    params: {
        [k: string]: string
    }[];
    middlewares: string[];
    routes: IServerRoute[];
}

export interface IServerConfig {
    port: string | number;
    routes: IServerRoute[];
    global_vars: Record<string, object>;
}

export default class ServerResource {
    private server: express.Express;
    public routes: IServerRoute[] = [];
    private config: IServerConfig | undefined;
    private logic: Record<string, Logic>;

    constructor(logic: Record<string, Logic>) {
        this.server = express();
        this.logic = logic;
    }

    register_config(config: IServerConfig) {
        this.config = config
        for (const key of Object.keys(this.config.global_vars)) this.server.set(key, this.config.global_vars[key]);
        this.routes = this.config.routes;
    }

    parse_routes(router?: express.Router, _routes?: IServerRoute[]) {
        let methods: Record<Methods, Function>;
        if (!router) {
            methods = {
                "GET": this.server.get,
                "POST": this.server.post,
                "PUT": this.server.put,
                "PATCH": this.server.patch,
                "DELETE": this.server.delete,
            }
        } else {
            methods = {
                "GET": router.get,
                "POST": router.post,
                "PUT": router.put,
                "PATCH": router.patch,
                "DELETE": router.delete,
            }
        }
        const routes = _routes || this.routes;
        routes.forEach(route => {
            let route_name = `/${route.path}`;
            for(const params of Object.keys(route.params)) {
                route_name += `/:${params}`
            }
            route_name = route_name + "/";

            if (route.routes.length != 0 && route.method != null) {
                const logic_functions: ((req: Request, res: Response) => any)[] = [];
                for (const logic_name of Object.keys(this.logic)) {
                    logic_functions.push(this.logic[logic_name].get_logic() as ((req: Request, res: Response) => any));
                }
                methods[route.method](route_name, ...logic_functions);
            } else {
                const _router = express.Router();
                this.parse_routes(router, route.routes);
                if(router != undefined) {
                    router.use(route_name, _router)
                } else {
                    this.server.use(route.path, _router);
                }
            }
        });
    }

    run() {
        if(this.config != undefined){
            const port: number = typeof this.config.port == "string" ? parseInt(this.config.port) : this.config.port
            this.server.listen(port, '0.0.0.0', () => {
                console.log(`[DEBUG]: SERVER LISTENING ON PORT http://0.0.0.0:${this.config?.port}`);
            });
        }
    }
}