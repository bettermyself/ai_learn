function processUsers(users) {
    if (users && users.length>0){
        const name = users?.[0]?.name || "UNKNOWN";
        return name.toUpperCase();
    }
    return "NO USERS";
}

console.log(processUsers([{ name: "alice" }, { name: "bob" }])); // "ALICE"
console.log(processUsers([]));                                  // "NO USERS"
console.log(processUsers(null));                                // "NO USERS"
console.log(processUsers(undefined));                           // "NO USERS"
console.log(processUsers([{}]));                                // "UNKNOWN"
console.log(processUsers([{ name: "" }]));