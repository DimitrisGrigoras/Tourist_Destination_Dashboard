<?php
if (strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') == 0) {
    if (strcasecmp($_SERVER["CONTENT_TYPE"], "application/json") == 0) {
        $json = trim(file_get_contents("php://input"));
        $data = json_decode($json);
        // access properties of PHP object
        $time_now = time();
        $address =  urldecode($data->address);
        $region =  $data->region;
        $city =  $data->city;
        

        $conn = mysqli_connect("dbserver.in.cs.ucy.ac.cy", "student", "gtNgMF8pZyZq6l53") or die("Could not connect: " .
            mysqli_error($conn));
	echo "Connection established<br/>";
        mysqli_select_db($conn, "epl425") or die("db will not open" . mysqli_error($conn));
        $query = "INSERT INTO requests (username, timestamp, address, region, city, country) VALUES ('$data->username', '$time_now', '$address', '$region', '$city', 'None')";
        $result = mysqli_query($conn, $query) or die("Invalid query");
        echo "Successful Query";
        mysqli_close($conn);
    }
}

if (strcasecmp($_SERVER['REQUEST_METHOD'], 'GET') == 0) {
    $res_array = array();
    $conn = mysqli_connect("dbserver.in.cs.ucy.ac.cy", "student", "gtNgMF8pZyZq6l53") or die("Could not connect: " .
        mysqli_error($conn));
    mysqli_select_db($conn, "epl425") or die("db will not open" . mysqli_error($conn));
    $query = "SELECT * FROM requests WHERE username='dgrigo03' ORDER BY id DESC LIMIT 5";
    $result = mysqli_query($conn, $query) or die("Invalid query");
    $num = mysqli_num_rows($result);
    for ($i = 0; $i < $num; $i++) {
        $row = mysqli_fetch_row($result);
        $obj = new stdClass();
        $obj->timestamp = $row[2];
        $obj->address = $row[3];
        $obj->region = $row[4];
        $obj->city = $row[5];
        $res_array[] = $obj;
    }
    $res_array[] = $num;
    echo json_encode($res_array);
    mysqli_close($conn);
}
