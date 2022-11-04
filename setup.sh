# clone project
git clone https://github.com/imsujinpark/project_cutepon
cd project_cutepon/
git fetch
git checkout backend

# setup run script
cd server/
touch run.sh
chmod +x run.sh
# TODO add the content of run.sh

# setup bun
sudo apt-get install unzip
chmod +x setup.sh
curl https://bun.sh/install | bash
"\n" >> ~/.bashrc
'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
"\n" >> ~/.bashrc
'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
. ~/.bashrc
bun install
mkdir data
# run as admin with sudo /home/ubuntu/.bun/bin/bun in the run.sh