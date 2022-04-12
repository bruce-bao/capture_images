<?php
$webUrl = $_POST['web_url'];
$imageType = $_POST['image_type'];
$minImageSize = $_POST['min_image_size'];
$maxImageSize = $_POST['max_image_size'];
$imageType = addslashes(json_encode($imageType));
// 校验参数是否合法
$path = "python3 main.py "; //需要注意的是：末尾要加一个空格

//passthru($path . $webUrl . ' ' . $minImageSize . ' ' . $maxImageSize . ' ' . $imageType);//等同于命令`python python.py 参数`，并接收打印出来的信息
exec($path . $webUrl . ' ' . $minImageSize . ' ' . $maxImageSize . ' ' . $imageType, $output,
    $res);//等同于命令`python python.py 参数`，并接收打印出来的信息
if ($res === 0) {
    $url = parse_url($webUrl);
    $path = $url['host'] . explode('.', $url['path'])[0];
    $webUrl = 'http://www.ymlwww.work';
    $path = './Downloads/' . $path;
    $imageList = getDir($webUrl, $path);
    $imageRes = [];
    foreach ($imageList as $image) {
        $info = getimagesize($webUrl . $path . '/' . $image);
        $size = filesize($path . '/' . $image);
        $imageRes[] = [
            'url'    => $path . '/' . $image,
            'detail' => explode('.', $image)[1] . ' ' . round($size / 1024, 1) . 'kb' . ' ' . $info[0] . 'x' . $info[1]
        ];
    }
    apiSuccess($imageRes);
} else {
    apiSuccess([]);
}

function apiSuccess($data = [], $message = 'success！', $code = '200')
{
    $array = array(
        'code'    => (int)$code,
        'message' => $message,
        'data'    => $data
    );
    header('Content-type: text/json');
    echo json_encode($array);
    die;
}

function getDir($webUrl, $path)
{
    $imageList = [];
    if (is_dir($path)) {

        $dir = scandir($path);
        foreach ($dir as $value) {
            $sub_path = $path . '/' . $value;
            if ($value == '.' || $value == '..') {
                continue;
            } else {
                if (is_dir($sub_path)) {
                    getDir($webUrl, $sub_path);
                } else {
                    $imageList[] = $value;
                }
            }
        }
    }

    return $imageList;
}

