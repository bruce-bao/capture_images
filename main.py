import codecs
import datetime
import io
import json
import math
import os
import sys
import urllib
from io import StringIO
from urllib.parse import urlparse

import requests
from PIL import Image
from bs4 import BeautifulSoup


def is_json(myjson):
    try:
        json_object = json.loads(myjson)
    except ValueError as e:
        print(e)
        return False
    return True


def mkdir(path):
    folder = os.path.exists(path)
    if not folder:
        os.makedirs(path)


def log_msg(msg):
    # print msg
    log_path = './log/'
    mkdir(log_path)
    log_path_suffix = datetime.datetime.now().strftime('%Y-%m-%d')
    file_path = log_path + 'log_' + log_path_suffix + '.log'
    f = codecs.open(file_path, 'a+', 'utf-8')
    f.write(msg + '\n\r')
    f.close()


def captureImage(webUrl, minImageSize, maxImageSize, imageType):

    header = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
    }
    resp = requests.get(webUrl, header)
    src = resp.text

    urlInfo = urlparse(webUrl)
    urlHead = urlInfo.scheme + '://' + urlInfo.netloc + '/'

    # 图片本地保存路径
    path = './Downloads/' + urlInfo.netloc + urlInfo.path.split('.')[0]
    path = path.rstrip('/') + '/'

    # 图片访问路径
    url_path = 'http://www.captureimages.com' + path
    # 创建下载目录
    mkdir(path)

    totalImageFiles = os.listdir(path)  # 得到文件夹下的所有文件名称

    # 获取img标签
    soup = BeautifulSoup(src, features='html.parser')
    imgs = soup.select('img')
    # 下载成功的图片
    success_data = []
    for img in imgs:
        # log_msg(str(img))
        img = img['src']
        # 文件名 abc.jpg
        file_name = os.path.split(img)[1]
        # 排除路径为空的图片和已经下载的图片
        if img == '' or file_name in totalImageFiles:
            continue

        # 图片文件后缀
        file_suffix = os.path.splitext(img)[1]

        # 校验图片类型是否在指定的类型范围中
        if file_suffix[1:] in imageType:
            # 图片文件名 abc.jpg
            file_name = os.path.split(img)[1]
            # 图片文件名不带后缀 abc
            file_name_without = os.path.splitext(file_name)[0]
            # 图片文件名不带后缀 abc
            file_name_without = file_name_without.replace('/', '')
            # 组装本地文件存储路径 /Downloads/www.abc.com/abc.jpg
            filename = '{}{}{}'.format(path, file_name_without, file_suffix)
            # 组装本地图片可访问的路径 http://www.demo.com/Downloads/www.abc.com/abc.jpg
            filename2 = url_path + file_name_without + file_suffix

            log_msg(u'下载图片，地址：' + filename)
            log_msg(u'下载图片，url地址：' + filename2)

            try:
                img2 = img
                if urlHead != '':
                    if img[0:4] != 'http':
                        if img[0] == '/':
                            img2 = urlHead + img
                        else:
                            img2 = urlHead + "/" + img

                # 判断文件大小
                image = requests.get(img2).content
                image_b = io.BytesIO(image).read()
                size = len(image_b) / 1e3  # kb

                if (math.ceil(size) > int(maxImageSize)) or (math.ceil(size) < int(minImageSize)):
                    log_msg(u'原始图片大小：' + str(size))
                    continue

                urllib.request.urlretrieve(img2, filename=filename)
                success_data.append(filename2)
            except Exception as e:
                log_msg(u"图片下载失败，原因： " + str(e))
                log_msg(img)

    return success_data


def main(argv):
    webUrl = argv[0]
    minImageSize = argv[1]
    maxImageSize = argv[2]
    imageType = argv[3]
    imageType = json.loads(imageType)  # json转为list

    successData = captureImage(webUrl, minImageSize, maxImageSize, imageType)
    print(successData)


if __name__ == '__main__':
    main(sys.argv[1:])
