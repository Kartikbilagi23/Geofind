import { createContext,useContext,useEffect,useState,type ReactNode } from "react";
import { useQuery } from "@apollo/client/react";
import { ME } from "../graphql/queries";

type User={
id:string,
name?:string,
email:string
}
type Medata={
    me:User | null;
}

type UserContextType={
    user:User | null;
    setUser:(user:User|null)=>void;
    logout:()=>void;
    refreshUser:()=>Promise<void>;
}

const UserContext=createContext<UserContextType|undefined>(undefined);
export function UserProvider({children}:{children:ReactNode}) {
    const [user, setUser] = useState<User| null>(null);
    const [authchecked, setauthchecked] = useState(false);
    const [token, settoken] = useState(()=>localStorage.getItem("token"));
    const {data,loading,error,refetch}=useQuery<Medata>(ME,{
        skip:!token,
        fetchPolicy:"network-only"
    });
    const logout=()=>{
        localStorage.removeItem("token");
        settoken(null);
        setUser(null);
        setauthchecked(true);
    }
    const refreshUser=async ()=>{
        const newToken=localStorage.getItem("token");
        if(!newToken){
        settoken(null);
        setUser(null);
        setauthchecked(true);
        }
        settoken(newToken);
        try {
            const res=await refetch();
            setUser(res.data.me);
        } catch (error) {
            console.error("Failed to fetch user:",error);
            setUser(null);
        }
        setauthchecked(true);
    }
    useEffect(()=>{
        if(!token){
            setUser(null);
            setauthchecked(true);
            return;
        }
        if(!loading){
            if(data?.me){
                setUser(data.me);
            }
            else if (error){
                setUser(null);
            }
            setauthchecked(true);
        }
    },[token,loading,data,error])

    if(!authchecked){
        return <div>Loading..</div>
    }

    return (
        <UserContext.Provider value={{user,setUser,logout,refreshUser}}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser(){
    const context=useContext(UserContext);
    if(!context){
        throw new Error("useUser must be inside UserProvider")
    }
    return context;
}
