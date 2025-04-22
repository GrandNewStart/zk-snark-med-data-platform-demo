pragma circom 2.0.0;

template RangeProof() {
    signal input min;
    signal input max;
    signal input x;

    signal minOk;
    signal maxOk;

    minOk <== x - min;
    maxOk <== max - x;

    assert(minOk >= 0);
    assert(maxOk >= 0);
}

component main = RangeProof();