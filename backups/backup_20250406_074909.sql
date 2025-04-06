--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Evento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Evento" (
    id integer NOT NULL,
    nome text NOT NULL,
    local text NOT NULL,
    data timestamp(3) without time zone NOT NULL,
    finalizado boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pais text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    arrecadacao double precision,
    "payPerView" integer,
    "publicoTotal" integer
);


ALTER TABLE public."Evento" OWNER TO postgres;

--
-- Name: Evento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Evento_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Evento_id_seq" OWNER TO postgres;

--
-- Name: Evento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Evento_id_seq" OWNED BY public."Evento".id;


--
-- Name: Luta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Luta" (
    id integer NOT NULL,
    "eventoId" integer NOT NULL,
    "lutador1Id" integer NOT NULL,
    "lutador2Id" integer NOT NULL,
    "vencedorId" integer,
    "metodoVitoria" text,
    round integer,
    "disputaTitulo" boolean DEFAULT false NOT NULL,
    bonus text,
    categoria text NOT NULL,
    "noContest" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tempo text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Luta" OWNER TO postgres;

--
-- Name: Luta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Luta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Luta_id_seq" OWNER TO postgres;

--
-- Name: Luta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Luta_id_seq" OWNED BY public."Luta".id;


--
-- Name: Lutador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Lutador" (
    id integer NOT NULL,
    nome text NOT NULL,
    pais text NOT NULL,
    sexo text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    altura double precision NOT NULL,
    apelido text,
    "categoriaAtual" text DEFAULT 'Peso Médio'::text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lutador" OWNER TO postgres;

--
-- Name: Lutador_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Lutador_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Lutador_id_seq" OWNER TO postgres;

--
-- Name: Lutador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Lutador_id_seq" OWNED BY public."Lutador".id;


--
-- Name: Ranking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Ranking" (
    id integer NOT NULL,
    "lutadorId" integer NOT NULL,
    categoria text NOT NULL,
    posicao integer NOT NULL,
    pontos integer NOT NULL,
    "corFundo" text,
    variacao integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Ranking" OWNER TO postgres;

--
-- Name: Ranking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Ranking_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Ranking_id_seq" OWNER TO postgres;

--
-- Name: Ranking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Ranking_id_seq" OWNED BY public."Ranking".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Evento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evento" ALTER COLUMN id SET DEFAULT nextval('public."Evento_id_seq"'::regclass);


--
-- Name: Luta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta" ALTER COLUMN id SET DEFAULT nextval('public."Luta_id_seq"'::regclass);


--
-- Name: Lutador id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lutador" ALTER COLUMN id SET DEFAULT nextval('public."Lutador_id_seq"'::regclass);


--
-- Name: Ranking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ranking" ALTER COLUMN id SET DEFAULT nextval('public."Ranking_id_seq"'::regclass);


--
-- Data for Name: Evento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Evento" (id, nome, local, data, finalizado, "createdAt", pais, "updatedAt", arrecadacao, "payPerView", "publicoTotal") FROM stdin;
43	UFC 1: The Beginning	McNichols Sports Arena	1993-11-12 00:00:00	t	2025-04-06 04:28:58.514	EUA	2025-04-06 04:34:00.387	86000	\N	7800
44	UFC 2: No Way Out	Mammoth Gardens	1994-11-12 00:00:00	t	2025-04-06 07:30:42.002	EUA	2025-04-06 07:30:58.857	\N	\N	2000
\.


--
-- Data for Name: Luta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Luta" (id, "eventoId", "lutador1Id", "lutador2Id", "vencedorId", "metodoVitoria", round, "disputaTitulo", bonus, categoria, "noContest", "createdAt", tempo, "updatedAt") FROM stdin;
402	43	152	153	152	Nocaute	1	f	Performance da Noite	Peso Casado	f	2025-04-06 04:28:58.55	\N	2025-04-06 04:28:58.55
404	43	160	161	160	Finalização	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.396	\N	2025-04-06 04:34:00.396
406	43	152	154	152	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.4	\N	2025-04-06 04:34:00.4
407	43	158	159	158	Finalização	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.401	\N	2025-04-06 04:34:00.401
408	43	156	157	156	Finalização	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.403	\N	2025-04-06 04:34:00.403
409	43	154	155	154	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 04:34:00.405	\N	2025-04-06 04:34:00.405
403	43	156	152	156	Finalização	1	t	Performance da Noite	Peso Casado	f	2025-04-06 04:34:00.393	\N	2025-04-06 04:54:57.899
405	43	156	158	156	Finalização	1	f	Luta da Noite	Peso Casado	f	2025-04-06 04:34:00.398	\N	2025-04-06 04:55:03.531
410	44	156	159	156	Nocaute	1	t	\N	Peso Casado	f	2025-04-06 07:30:42.072	\N	2025-04-06 07:30:42.072
411	44	159	170	159	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.084	\N	2025-04-06 07:30:42.084
412	44	156	164	156	Finalização	1	f	Performance da Noite	Peso Casado	f	2025-04-06 07:30:42.093	\N	2025-04-06 07:30:42.093
413	44	159	173	159	Nocaute	1	f	Performance da Noite	Peso Casado	f	2025-04-06 07:30:42.1	\N	2025-04-06 07:30:42.1
414	44	170	175	170	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.106	\N	2025-04-06 07:30:42.106
415	44	164	166	164	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.112	\N	2025-04-06 07:30:42.112
416	44	156	160	156	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.119	\N	2025-04-06 07:30:42.119
417	44	173	174	173	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.125	\N	2025-04-06 07:30:42.125
418	44	159	172	159	Finalização	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.132	\N	2025-04-06 07:30:42.132
419	44	170	171	170	Nocaute	3	f	\N	Peso Casado	f	2025-04-06 07:30:42.137	\N	2025-04-06 07:30:42.137
420	44	168	169	168	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.145	\N	2025-04-06 07:30:42.145
421	44	166	167	166	Nocaute	1	f	\N	Peso Casado	f	2025-04-06 07:30:42.153	\N	2025-04-06 07:30:42.153
422	44	164	165	164	Finalização	2	f	\N	Peso Casado	f	2025-04-06 07:30:42.16	\N	2025-04-06 07:30:42.16
423	44	160	163	160	Nocaute	2	f	\N	Peso Casado	f	2025-04-06 07:30:42.167	\N	2025-04-06 07:30:42.167
424	44	156	162	156	Finalização	2	f	Luta da Noite	Peso Casado	f	2025-04-06 07:30:42.175	\N	2025-04-06 07:30:42.175
\.


--
-- Data for Name: Lutador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lutador" (id, nome, pais, sexo, "createdAt", altura, apelido, "categoriaAtual", "updatedAt") FROM stdin;
152	Gerard Gordeau	Holanda	Masculino	2025-04-06 04:28:34.643	1.8	\N	Peso Médio	2025-04-06 04:28:34.643
153	Teila Tuli	EUA	Masculino	2025-04-06 04:28:42.139	1.8	\N	Peso Médio	2025-04-06 04:28:42.139
154	Kevin Rosier	EUA	Masculino	2025-04-06 04:30:57.688	1.8	\N	Peso Médio	2025-04-06 04:30:57.688
155	Zane Frazier	EUA	Masculino	2025-04-06 04:31:03.169	1.8	\N	Peso Médio	2025-04-06 04:31:03.169
156	Royce Gracie	Brasil	Masculino	2025-04-06 04:31:23.237	1.8	\N	Peso Médio	2025-04-06 04:31:23.237
157	Art Jimmerson	EUA	Masculino	2025-04-06 04:31:30.058	1.8	\N	Peso Médio	2025-04-06 04:31:30.058
158	Ken Shamrock	EUA	Masculino	2025-04-06 04:32:02.656	1.8	\N	Peso Médio	2025-04-06 04:32:02.656
159	Patrick Smith	EUA	Masculino	2025-04-06 04:32:08.956	1.8	\N	Peso Médio	2025-04-06 04:32:08.956
160	Jason DeLucia	EUA	Masculino	2025-04-06 04:33:13.538	1.8	\N	Peso Médio	2025-04-06 04:33:13.538
161	Trent Jenkins	EUA	Masculino	2025-04-06 04:33:25.792	1.8	\N	Peso Médio	2025-04-06 04:33:25.792
162	Minoki Ichihara	Japão	Masculino	2025-04-06 07:19:30.36	1.8	\N	Peso Médio	2025-04-06 07:19:30.36
163	Scott Baker	EUA	Masculino	2025-04-06 07:20:11.94	1.8	\N	Peso Médio	2025-04-06 07:20:11.94
164	Remco Pardoel	Holanda	Masculino	2025-04-06 07:20:52.274	1.8	\N	Peso Médio	2025-04-06 07:20:52.274
165	Alberto Cerro Leon	Espanha	Masculino	2025-04-06 07:21:03.805	1.8	\N	Peso Médio	2025-04-06 07:21:03.805
166	Orlando Wiet	Holanda	Masculino	2025-04-06 07:23:24.423	1.8	\N	Peso Médio	2025-04-06 07:23:24.423
167	Robert Lucarelli	EUA	Masculino	2025-04-06 07:23:57.571	1.8	\N	Peso Médio	2025-04-06 07:23:57.571
168	Frank Hamaker	Holanda	Masculino	2025-04-06 07:24:32.269	1.8	\N	Peso Médio	2025-04-06 07:24:32.269
169	Thaddeus Luster	EUA	Masculino	2025-04-06 07:24:42.137	1.8	\N	Peso Médio	2025-04-06 07:24:42.137
170	Johnny Rhodes	EUA	Masculino	2025-04-06 07:25:17.402	1.8	\N	Peso Médio	2025-04-06 07:25:17.402
171	David Levicki	EUA	Masculino	2025-04-06 07:25:31.915	1.8	\N	Peso Médio	2025-04-06 07:25:31.915
172	Ray Wizard	EUA	Masculino	2025-04-06 07:26:01.801	1.8	\N	Peso Médio	2025-04-06 07:26:01.801
173	Scott Morris	EUA	Masculino	2025-04-06 07:26:24.432	1.8	\N	Peso Médio	2025-04-06 07:26:24.432
174	Sean Daugherty	EUA	Masculino	2025-04-06 07:26:36.35	1.8	\N	Peso Médio	2025-04-06 07:26:36.35
175	Fred Ettish	EUA	Masculino	2025-04-06 07:27:55.332	1.8	\N	Peso Médio	2025-04-06 07:27:55.332
\.


--
-- Data for Name: Ranking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Ranking" (id, "lutadorId", categoria, posicao, pontos, "corFundo", variacao, "createdAt", "updatedAt") FROM stdin;
496	156	Peso por Peso	1	83	dourado-claro	0	2025-04-06 07:30:58.903	2025-04-06 07:30:58.903
497	159	Peso por Peso	2	20	dourado-claro	7	2025-04-06 07:30:58.907	2025-04-06 07:30:58.907
498	152	Peso por Peso	3	15	dourado-claro	-1	2025-04-06 07:30:58.909	2025-04-06 07:30:58.909
499	164	Peso por Peso	4	11	dourado-claro	0	2025-04-06 07:30:58.91	2025-04-06 07:30:58.91
500	160	Peso por Peso	5	10	dourado-claro	-2	2025-04-06 07:30:58.911	2025-04-06 07:30:58.911
501	170	Peso por Peso	6	10	azul-escuro	0	2025-04-06 07:30:58.912	2025-04-06 07:30:58.912
502	168	Peso por Peso	7	8	azul-escuro	0	2025-04-06 07:30:58.913	2025-04-06 07:30:58.913
503	158	Peso por Peso	8	4	azul-escuro	-4	2025-04-06 07:30:58.915	2025-04-06 07:30:58.915
504	154	Peso por Peso	9	3	azul-escuro	-4	2025-04-06 07:30:58.916	2025-04-06 07:30:58.916
505	166	Peso por Peso	10	3	azul-escuro	0	2025-04-06 07:30:58.917	2025-04-06 07:30:58.917
506	173	Peso por Peso	11	3	azul-escuro	0	2025-04-06 07:30:58.918	2025-04-06 07:30:58.918
507	162	Peso por Peso	12	-4	azul-escuro	0	2025-04-06 07:30:58.919	2025-04-06 07:30:58.919
508	153	Peso por Peso	13	-5	azul-escuro	-7	2025-04-06 07:30:58.92	2025-04-06 07:30:58.92
509	155	Peso por Peso	14	-5	azul-escuro	-7	2025-04-06 07:30:58.921	2025-04-06 07:30:58.921
510	157	Peso por Peso	15	-5	azul-escuro	-7	2025-04-06 07:30:58.922	2025-04-06 07:30:58.922
511	161	Peso por Peso	16	-5		-6	2025-04-06 07:30:58.923	2025-04-06 07:30:58.923
512	163	Peso por Peso	17	-5		0	2025-04-06 07:30:58.924	2025-04-06 07:30:58.924
513	165	Peso por Peso	18	-5		0	2025-04-06 07:30:58.925	2025-04-06 07:30:58.925
514	167	Peso por Peso	19	-5		0	2025-04-06 07:30:58.926	2025-04-06 07:30:58.926
515	169	Peso por Peso	20	-5		0	2025-04-06 07:30:58.929	2025-04-06 07:30:58.929
516	171	Peso por Peso	21	-5		0	2025-04-06 07:30:58.93	2025-04-06 07:30:58.93
517	172	Peso por Peso	22	-5		0	2025-04-06 07:30:58.932	2025-04-06 07:30:58.932
518	174	Peso por Peso	23	-5		0	2025-04-06 07:30:58.933	2025-04-06 07:30:58.933
519	175	Peso por Peso	24	-5		0	2025-04-06 07:30:58.935	2025-04-06 07:30:58.935
520	156	Peso Médio	1	83	dourado-claro	0	2025-04-06 07:30:58.936	2025-04-06 07:30:58.936
521	159	Peso Médio	2	20	azul-escuro	7	2025-04-06 07:30:58.938	2025-04-06 07:30:58.938
522	152	Peso Médio	3	15	azul-escuro	-1	2025-04-06 07:30:58.939	2025-04-06 07:30:58.939
523	164	Peso Médio	4	11	azul-escuro	0	2025-04-06 07:30:58.94	2025-04-06 07:30:58.94
524	160	Peso Médio	5	10	azul-escuro	-2	2025-04-06 07:30:58.941	2025-04-06 07:30:58.941
525	170	Peso Médio	6	10	azul-claro	0	2025-04-06 07:30:58.942	2025-04-06 07:30:58.942
526	168	Peso Médio	7	8	azul-claro	0	2025-04-06 07:30:58.943	2025-04-06 07:30:58.943
527	158	Peso Médio	8	4	azul-claro	-4	2025-04-06 07:30:58.944	2025-04-06 07:30:58.944
528	154	Peso Médio	9	3	azul-claro	-4	2025-04-06 07:30:58.945	2025-04-06 07:30:58.945
529	166	Peso Médio	10	3	azul-claro	0	2025-04-06 07:30:58.946	2025-04-06 07:30:58.946
530	173	Peso Médio	11	3	azul-claro	0	2025-04-06 07:30:58.947	2025-04-06 07:30:58.947
531	162	Peso Médio	12	-4	azul-claro	0	2025-04-06 07:30:58.948	2025-04-06 07:30:58.948
532	153	Peso Médio	13	-5	azul-claro	-7	2025-04-06 07:30:58.949	2025-04-06 07:30:58.949
533	155	Peso Médio	14	-5	azul-claro	-7	2025-04-06 07:30:58.95	2025-04-06 07:30:58.95
534	157	Peso Médio	15	-5	azul-claro	-7	2025-04-06 07:30:58.951	2025-04-06 07:30:58.951
535	161	Peso Médio	16	-5		-6	2025-04-06 07:30:58.952	2025-04-06 07:30:58.952
536	163	Peso Médio	17	-5		0	2025-04-06 07:30:58.953	2025-04-06 07:30:58.953
537	165	Peso Médio	18	-5		0	2025-04-06 07:30:58.954	2025-04-06 07:30:58.954
538	167	Peso Médio	19	-5		0	2025-04-06 07:30:58.955	2025-04-06 07:30:58.955
539	169	Peso Médio	20	-5		0	2025-04-06 07:30:58.956	2025-04-06 07:30:58.956
540	171	Peso Médio	21	-5		0	2025-04-06 07:30:58.957	2025-04-06 07:30:58.957
541	172	Peso Médio	22	-5		0	2025-04-06 07:30:58.958	2025-04-06 07:30:58.958
542	174	Peso Médio	23	-5		0	2025-04-06 07:30:58.959	2025-04-06 07:30:58.959
543	175	Peso Médio	24	-5		0	2025-04-06 07:30:58.96	2025-04-06 07:30:58.96
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5e9f326e-1219-444d-b79d-468f09946976	38da17792910281b5a888ef51c4d975729e31d2fbbf3aff458baa2051760a6e0	2025-04-06 03:15:44.310655+00	20250401092337_init	\N	\N	2025-04-06 03:15:44.296214+00	1
343d3157-72a1-4a4b-bbb3-2122f35569f5	331d4bbc6084abcb4ea4b507422a0b7fa6695b0add67c4c529b2baf0eb22cfa9	2025-04-06 03:15:44.313155+00	20250401094742_add_finalizado_evento	\N	\N	2025-04-06 03:15:44.311244+00	1
b91c8de6-81a4-4825-bc39-217d2083c359	8f2d001a9bd9d3bb3673af735d1e82b0ffe91f641990f43a0c7e72ce3635342e	2025-04-06 03:15:44.318268+00	20250401101146_add_recorde_model	\N	\N	2025-04-06 03:15:44.313677+00	1
4e830b31-3fa2-4d7e-8271-0ab885f6239b	000e5eb5f28f1202f503f6f9c92bb85f3142b96e67217e6174346f7e0beb4a64	2025-04-06 03:15:44.321023+00	20250401102555_add_variacao_ranking	\N	\N	2025-04-06 03:15:44.318949+00	1
128fa708-918e-418a-b2db-fac3a354929b	834cad4547c237e52c066817b82a455595c7baddb9b4f83a799c085101ea4cfb	2025-04-06 03:15:44.324484+00	20250403054124_	\N	\N	2025-04-06 03:15:44.321787+00	1
721e33a6-4204-46ff-a37e-06207bf7467a	1f3dea53e9ab61a071bed77af2937bb799bde682684a537203839230340ba355	2025-04-06 03:17:13.171062+00	20250406031705_add_event_statistics	\N	\N	2025-04-06 03:17:13.167395+00	1
2518f426-26ae-4400-9818-a03b891fc18d	d44efa64b87192201ebb2888a92cb8fea42d0870642f246e01826e1b17525181	\N	20250406034900_add_evento_metrics	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250406034900_add_evento_metrics\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "publicoTotal" of relation "Evento" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"publicoTotal\\" of relation \\"Evento\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7246), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250406034900_add_evento_metrics"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20250406034900_add_evento_metrics"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:225	\N	2025-04-06 04:51:51.358339+00	0
\.


--
-- Name: Evento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Evento_id_seq"', 44, true);


--
-- Name: Luta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Luta_id_seq"', 424, true);


--
-- Name: Lutador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Lutador_id_seq"', 175, true);


--
-- Name: Ranking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Ranking_id_seq"', 543, true);


--
-- Name: Evento Evento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evento"
    ADD CONSTRAINT "Evento_pkey" PRIMARY KEY (id);


--
-- Name: Luta Luta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_pkey" PRIMARY KEY (id);


--
-- Name: Lutador Lutador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lutador"
    ADD CONSTRAINT "Lutador_pkey" PRIMARY KEY (id);


--
-- Name: Ranking Ranking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ranking"
    ADD CONSTRAINT "Ranking_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Lutador_nome_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Lutador_nome_key" ON public."Lutador" USING btree (nome);


--
-- Name: Luta Luta_eventoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES public."Evento"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Luta Luta_lutador1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_lutador1Id_fkey" FOREIGN KEY ("lutador1Id") REFERENCES public."Lutador"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Luta Luta_lutador2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_lutador2Id_fkey" FOREIGN KEY ("lutador2Id") REFERENCES public."Lutador"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Luta Luta_vencedorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Luta"
    ADD CONSTRAINT "Luta_vencedorId_fkey" FOREIGN KEY ("vencedorId") REFERENCES public."Lutador"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ranking Ranking_lutadorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ranking"
    ADD CONSTRAINT "Ranking_lutadorId_fkey" FOREIGN KEY ("lutadorId") REFERENCES public."Lutador"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

