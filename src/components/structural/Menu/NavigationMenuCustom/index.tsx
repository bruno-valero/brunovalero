"use client"

import * as React from "react";

import { cn } from "@/lib/utils";
// import { Icons } from "@/components/icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";

interface NavigationMenuCustomProps {
  components: { title: string; href?: string; action?:() => void; description: string }[];
}

export function NavigationMenuCustom({ components }:NavigationMenuCustomProps) {

  const globalState = useGlobalProvider();
  const [, setResetedState] = globalState.resetedState;
  const globalUser = globalState.globalUser;

  return (
    <NavigationMenu navMenuVPClassName={'left-[-150px]'} >
      <NavigationMenuList>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className='h-[80px]' >
            {/* <img src={user.image} alt={user.fullName ?? user.name} className='h-[60px] w-[60px] rounded-full' /> */}
            <span>{globalUser.data ? `Olá, ${globalUser.data.name.split(' ')[0]}` : `Mais`}</span>
          </NavigationMenuTrigger>
          <NavigationMenuContent >
            <ul className="grid max-w-[300px] gap-3 p-4 md:w-[500px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                  action={component.action}                  
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>        
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">  & {action?:() => void}  
>(({ className, title, action, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        {action ? (
          <button
            className={cn(
              "block text-left select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            onClick={() => action()}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </button>
        ) : (
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>

        )}
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
