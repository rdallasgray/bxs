Bxs.Response = {
	
	success: function(action,status) {
      console.debug([action, status]);
 		switch(action) {

			case "insert":
			if (status === 201) {
				return true;
			}
			break;
		
			case "update":
			if (status === 200 || status === 304) {
				return true;
			}
			break;

			case "delete":
			if (status === 204) {
				return true;
			}
			break;
		}
		
		return false;
	}
	
}
