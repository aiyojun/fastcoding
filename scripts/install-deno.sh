#!/bin/sh
which deno >/dev/null 2>&1
if [[ $? = '0' ]]; then
	echo "Deno has already been installed : $(which deno)"
	exit 0
fi
# curl -fsSL https://deno.land/install.sh | sh
echo export DENO_INSTALL=\"/root/.deno\" >>~/.bashrc
echo export PATH=\"\$DENO_INSTALL/bin:\$PATH\" >>~/.bashrc
# source ~/.bashrc
export DENO_INSTALL="/root/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
echo "console.info('\nHello deno ...\n')" | deno run -