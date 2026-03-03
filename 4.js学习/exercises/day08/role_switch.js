function getPermission(role){
    switch (role) {
        case 'admin':
            return 3;
        case 'user':
            return 2;
        case 'guest':
            return 1;
        default:
            return 0;
    }
}
  console.log(getPermission("admin"));    // 3
  console.log(getPermission("user"));     // 2
  console.log(getPermission("guest"));    // 1
  console.log(getPermission("unknown"));  // 0
  console.log(getPermission(null));       // 0
  console.log(getPermission(undefined));  // 0