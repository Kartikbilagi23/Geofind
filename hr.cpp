#include <bits/stdc++.h>

using namespace std;

string ltrim(const string &);
string rtrim(const string &);



/*
 * Complete the 'countResponseTimeRegressions' function below.
 *
 * The function is expected to return an INTEGER.
 * The function accepts INTEGER_ARRAY responseTimes as parameter.
 */

void countResponseTimeRegressions(vector<int> responseTimes) {
    int n=responseTimes.size();
    vector<int>pf(n+1,0);
    for(int i=1;i<=n;i++){
        pf[i]=(pf[i-1]+responseTimes[i-1]);
    }
    int ans=0;
    for(int i=0;i<n;i++){
        if(i>0&&responseTimes[i]>pf[i]/i){
            ans++;
        }
    }
    cout<<ans<<"\n";
}

signed main(){
    vector<int> responseTimes={100, 200, 150,300};
    countResponseTimeRegressions(responseTimes);
}