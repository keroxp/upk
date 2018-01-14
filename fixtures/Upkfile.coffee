git "keroxp/unicommon", "~>0.0.8"
#git "neuce/unirx", "5.5.6",
#  includes: [""],
#  excludes:["Assets/Plugins"],
#  map: [
#    src: "Assets/Plugins/Scripts", dest: "Assets/UniRx/Scripts"
#]
git "git@somegit.com:keroxp/some.git"
zip "https://some.com/asset.zip"
asset "LocalAsset", "./local/LocalAsset"
upk "Unity-Chan", "http://hogehoge.com/utcs.unitypackage"
upk "SocialConnector", -> git "anchan828/social-connector"
upk "UniCommon", ->
  zip "http://localhost:8001/fixtures/unicommondir.zip", -> "UniCommon"
upk "SDUnity-Chan", -> zip "http://unity-chan.com/download/download.php?id=SDUnityChan&v=1.01"