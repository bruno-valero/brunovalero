import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useMemo } from "react";

import { Pdf, QuestionPdf } from "@/src/config/firebase-admin/collectionTypes/pdfReader";
import colors from "@/src/constants/colors";
import { UseState } from "@/utils/common.types";
import { PdfFunctions } from "..";
import AskQuestion from "./AskQuestion";
import ShowQuestionContent from "./ShowQuestionContent";

interface QuestionSectionProps {
    questionHooks:{
        showQuestions:UseState<boolean>,
        questionList:UseState<QuestionPdf[]>,
        showQuestion:UseState<QuestionPdf | null>,
        askQuestion:UseState<boolean>,
        details:UseState<Pdf | null>,
        showQuestionList:UseState<boolean>,
        search:UseState<string>,
    },
    functions:PdfFunctions,
    
}

export default function QuestionSection({ questionHooks, functions  }:QuestionSectionProps) {

    const globalState = useGlobalProvider();
    const [, setResetedState] = globalState.resetedState ?? [];
    const globalUser = globalState.globalUser;
    const { db, storage } = globalState.firebase ?? {};
    const [publicError, setPublicError] = globalState.publicError ?? [];
    const dimensions = globalState.dimensions;


    const [ questionList, setQuestionList ] = questionHooks?.questionList ?? [];
    const [ showQuestion, setShowQuestion ] = questionHooks?.showQuestion ?? [];
    const [askQuestion, setAskQuestion] = questionHooks?.askQuestion ?? [];
    const [details, setDetails] = questionHooks?.details ?? [];
    const [showQuestionList, setShowQuestionList] = questionHooks?.showQuestionList ?? [];
    const [search, setSearch] = questionHooks?.search ?? [];

    function gotToQuestion(question:QuestionPdf) {
        setShowQuestion(question);
        setShowQuestionList(false);
        setAskQuestion(false);
    }

    const { choosePdf, goToQuestions } = functions ?? {};

    const questionListMemo = useMemo(() => {
        // const replace = search.replaceAll(/[^a-zA-Z\s.,!?áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/ig, '')
        const backendSearch = search ?? ''
        const replace = backendSearch.replaceAll(/[^a-zA-Z\s]/ig, '')
        const regexp = new RegExp(replace, 'ig');
        const questionFilter = (questionList ?? []).filter(item => regexp.test(item.question.replaceAll(/[^a-zA-Z\s]/ig, '')) || regexp.test(decodeURIComponent(item.response.text).replaceAll(/[^a-zA-Z\s]/ig, '')));
        return questionFilter.map(item => (
        <button key={item.id} onClick={() => gotToQuestion(item)} className="rounded-md shadow p-4 w-full my-2" >
            <h3 className="text-lg font-semibold" style={{color:colors.valero()}} >
                {item.question}
            </h3>
        </button>
    ))
}, [questionList, search]);


    return (
        dimensions &&
        <div className="w-full" >
            {showQuestion && !askQuestion && !showQuestionList ? (
                <ShowQuestionContent questionHooks={questionHooks} />
            ) : ((questionList.length === 0 || askQuestion) && !showQuestionList) ? (
                <AskQuestion questionHooks={questionHooks} functions={functions} />
            ) : questionListMemo}
        </div>
    );

};