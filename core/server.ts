import express, { Request, Response } from "express";
import Logic from "./logic";
import InternalResource from "./internal_resource";

enum Methods {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

export interface IServerRoute {
    path: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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

export default class ServerResource extends InternalResource<IServerConfig> {
    private server: express.Express;
    public routes: IServerRoute[] = [];
    private config: IServerConfig | undefined;
    private logic: Record<string, Logic>;
    private routes_registered: boolean = false;

    constructor(logic: Record<string, Logic>) {
        super();
        this.server = express();
        this.logic = logic;
    }

    register_config(config: IServerConfig) {
        this.config = config
        for (const key of Object.keys(this.config.global_vars)) this.server.set(key, this.config.global_vars[key]);
        this.routes = this.config.routes;
    }

    parse_routes(router?: express.Router, _routes?: IServerRoute[]) {
        this.routes_registered = true;
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
            let route_name = `${route.path}`;
            if(Object.keys(route).includes("params")){
                for(const params of route.params) {
                    route_name += `/:${params.name}`
                }
            }
            route_name = route_name + "/";
            if (!Object.keys(route).includes("routes") && Object.keys(route).includes("method")) {
                const logic_functions: ((req: Request, res: Response) => any)[] = [];
                for (const logic_name of Object.keys(this.logic)) {
                    logic_functions.push(this.logic[logic_name].get_logic() as ((req: Request, res: Response) => any));
                }
                switch (route.method) {
                    case Methods.GET:
                        if(router){
                            router['get'](route_name, ...logic_functions)
                        }
                        this.server["get"](route_name, ...logic_functions);
                        break;
                
                    case Methods.POST:
                        if(router){
                            router['post'](route_name, ...logic_functions)
                        }
                        this.server["post"](route_name, ...logic_functions);
                        break;

                    case Methods.PUT:
                        if(router){
                            router['put'](route_name, ...logic_functions)
                        }
                        this.server["put"](route_name, ...logic_functions);
                        break;

                    case Methods.PATCH:
                        if(router){
                            router['patch'](route_name, ...logic_functions)
                        }
                        this.server["patch"](route_name, ...logic_functions);
                        break;

                    case Methods.DELETE:
                        if(router){
                            router['delete'](route_name, ...logic_functions)
                        }
                        this.server["delete"](route_name, ...logic_functions);
                        break;
                
                    default:
                        console.error("method not allowed");
                }
            } else {
                const _router = express.Router();
                this.parse_routes(_router, route.routes);
                if(router != undefined) {
                    router.use(route_name, _router)
                } else {
                    this.server.use(route.path, _router);
                }
            }
        });
    }

    run() {
        if(!this.routes_registered) this.parse_routes();
        if(this.config != undefined){
            const port: number = typeof this.config.port == "string" ? parseInt(this.config.port) : this.config.port
            this.server.listen(port, '0.0.0.0', () => {
                console.log(`[DEBUG]: SERVER LISTENING ON PORT http://0.0.0.0:${this.config?.port}`);
            });
        }
    }
}