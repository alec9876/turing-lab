export const LESSONS=[
    {
        id:"read",title:"1. Read a machine",readOnly:true,mode:"tape",input:"111",
        text:"A Turing machine has a tape of cells, a head that reads one cell at a time, and a current state. Each rule says: if I am in this state and read this symbol, write something, move the head, and switch state. The machine below adds one to a unary number (a row of 1s).",
        goal:"Turn on Predict mode, then step through the machine until it halts. Watch which rule lights up in the table each time. Then run the tests to confirm.",
        rules:"# keep moving right over the 1s\nq0 1 -> 1 R q0\n# at the first blank, write a 1 and stop\nq0 _ -> 1 R halt",
        hints:["The highlighted row is the rule about to run.","While reading 1s, the machine writes 1 back and moves right.","The blank (_) marks the end of the number."],
        tests:[
            {
                input:"111",
                expect:"1111"
            },
            {
                input:"",
                expect:"1"
            },
            {
                input:"11111",
                expect:"111111"
            }
        ]
    },
    {
        id:"flip",title:"2. Flip every bit",mode:"tape",input:"0110",
        text:"Now you write the rules. The machine should turn every 0 into 1 and every 1 into 0, moving along the tape.",
        goal:"Build a machine that flips each bit, then goes to halt when it reaches the blank after the input.",
        rules:"# state symbol -> write move next\n",
        hints:["One state (q0) is enough.","For each of 0 and 1, write the opposite symbol and move R, staying in q0.","When q0 reads _, write _ and go to halt."],
        tests:[
            {
                input:"0110",
                expect:"1001"
            },
            {
                input:"",
                expect:""
            },
            {
                input:"1111",
                expect:"0000"
            },
            {
                input:"1",
                expect:"0"
            },
            {
                input:"010101",
                expect:"101010"
            }
        ]
    },
    {
        id:"parity",title:"3. Even or odd 1s",mode:"decide",input:"1011",
        text:"Some machines don’t produce output. They answer a yes/no question by ending in the accept state or the reject state. Your machine must remember something while it moves, and the only memory it has is its state.",
        goal:"Accept when the number of 1s is even (zero counts as even). Reject when it is odd.",
        rules:"# state symbol -> write move next\n",
        hints:["Use two states: one for even so far, one for odd so far.","Reading a 1 switches between the two states. Reading a 0 changes nothing.","At the blank, the even state goes to accept and the odd state goes to reject."],
        tests:[
            {
                input:"",
                expect:true
            },
            {
                input:"1",
                expect:false
            },
            {
                input:"11",
                expect:true
            },
            {
                input:"0110",
                expect:true
            },
            {
                input:"1011",
                expect:false
            },
            {
                input:"000",
                expect:true
            },
            {
                input:"10101",
                expect:false
            }
        ]
    }
];
